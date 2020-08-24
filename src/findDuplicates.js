import path from 'path';
import globby from 'globby';
import sass from 'sass';
import css from 'css';
import Tokenizer from 'css-selector-tokenizer';
import _ from 'lodash';

const getFullPath = (filepath) => path.resolve(process.cwd(), filepath, '**/*.scss');

const getCss = (filePath) => {
  const cssData = sass.renderSync({
    file: filePath,
    importer(url) {
      if (_.startsWith(url, '~styles')) {
        const fileName = `${_.replace(url, '~', '')}.scss`;
        return { file: path.resolve('src', fileName) };
      }

      if (_.startsWith(url, '~test/')) {
        const fileName = `${_.replace(url, '~test/', '')}.scss`;
        return { file: path.resolve('__fixtures__/project', fileName) };
      }

      if (_.startsWith(url, '~@templates/')) {
        const fileName = `${_.replace(url, '~@templates/', '')}.scss`;
        return { file: path.resolve('temp/src/components', fileName) };
      }

      if (_.startsWith(url, '@templates/')) {
        const fileName = `${_.replace(url, '@templates/', '')}.scss`;
        return { file: path.resolve('temp/src/components', fileName) };
      }

      return null;
    },
  });

  const cssFileData = cssData.css.toString();

  return cssFileData;
};

const getCssClasses = (cssFileData) => {
  const ast = css.parse(cssFileData);

  const rules = _.get(ast, 'stylesheet.rules');

  const selectors = _.flatMap(rules, (rule) => _.get(rule, 'selectors'));

  const classes = _.flatMap(selectors, (selector) => {
    const selectorData = Tokenizer.parse(selector);

    const tokenizerSelectors = selectorData.nodes.filter(({ type }) => type === 'selector');

    const baseClass = _.flatMap(tokenizerSelectors, ({ nodes }) => {
      const selectorClassesNodes = nodes.filter(({ type }) => type === 'class').map(({ name }) => name);

      if (_.isEmpty(selectorClassesNodes)) {
        return [];
      }

      // console.log('clases: ', selectorClassesNodes)

      return _.head(selectorClassesNodes);
    });

    return baseClass;
  });

  return _.uniq(classes);
};

const getCollisions = (items, fileClasses) => {
  return items.reduce((acc, item) => {
    const intersectedClasses = _.intersection(item.fileClasses, fileClasses);
    if (_.isEmpty(intersectedClasses)) {
      return acc;
    }
    return [...acc, { filePath: item.filePath, intersectedClasses }];
  }, []);
};

/**
 * @param {String} dirPath
 */
export default async (dirPath) => {
  const filesPaths = await globby(getFullPath(dirPath));

  const filesPathsWithClasses = filesPaths
    .reduce((acc, filePath) => {
      const cssFileData = getCss(filePath);

      const fileClasses = getCssClasses(cssFileData);
      const collisions = getCollisions(acc, fileClasses);

      return [...acc, { filePath, fileClasses, collisions }];
    }, [])
    .filter(({ collisions }) => !_.isEmpty(collisions));

  return filesPathsWithClasses;
};
