const threadLoader = require('thread-loader');
const webpack = require('webpack');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;

const config = require('dotenv').config().parsed;

function resolve(dir) {
  return path.join(__dirname, '..', dir);
}

const packageInfo = require('./package.json');

const babelConfig = packageInfo.babel;

const path = require('path');

module.exports = {
  entry: {
    edu_sdk: './src/infra/api/index.tsx',
  },
  mode: 'production',
  output: {
    publicPath: '',
    filename: '[name].bundle.js',
    libraryTarget: 'umd',
    library: 'AgoraMeetingSDK',
    libraryExport: 'default',
    path: path.resolve(__dirname, 'lib'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      src: path.resolve(__dirname, 'src'),
      '@': path.resolve(__dirname, 'src'),
      '~ui-kit': path.resolve(__dirname, '../agora-meeting-ui/src'),
      '~components': path.resolve(
        __dirname,
        '../agora-meeting-ui/src/components',
      ),
      '~utilities': path.resolve(
        __dirname,
        '../agora-meeting-ui/src/utilities',
      ),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts(x)?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              ...babelConfig,
            },
          },
          {
            loader: 'thread-loader',
            options: {},
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, '../agora-meeting-ui/src'),
          path.resolve(__dirname, '../../node_modules/rc-slider'),
          path.resolve(__dirname, '../../node_modules/rc-pagination'),
          path.resolve(__dirname, '../../node_modules/rc-notification'),
        ],
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                ident: 'postcss',
                config: path.resolve(__dirname, './postcss.config.js'),
              },
            },
          },
          {
            loader: 'thread-loader',
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg|mp4|webm|ogg|mp3|wav|flac|aac|woff|woff2|eot|ttf)$/,
        loader: 'url-loader',
        options: {
          esModule: false,
        },
      },
      // fix: https://github.com/gildas-lormeau/zip.js/issues/212#issuecomment-769766135
      {
        test: /\.js$/,
        loader: require.resolve('@open-wc/webpack-import-meta-loader'),
      },
    ],
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: require('os').cpus().length,
      }),
      new OptimizeCssAssetsPlugin({
        assetNameRegExp: /\.css$/g,
        cssProcessorOptions: {
          safe: true,
          autoprefixer: { disable: true },
          mergeLonghand: false,
          discardComments: {
            removeAll: true,
          },
        },
        canPrint: true,
      }),
    ],
  },
  plugins: [
    // new BundleAnalyzerPlugin(),
    new MiniCssExtractPlugin(),
    new webpack.DefinePlugin({
      REACT_APP_AGORA_APP_RTM_TOKEN: JSON.stringify(
        config.REACT_APP_AGORA_APP_RTM_TOKEN,
      ),
      REACT_APP_AGORA_GTM_ID: JSON.stringify(config.REACT_APP_AGORA_GTM_ID),
      REACT_APP_BUILD_VERSION: JSON.stringify(config.REACT_APP_BUILD_VERSION),
      REACT_APP_NETLESS_APP_ID: JSON.stringify(config.REACT_APP_NETLESS_APP_ID),
      REACT_APP_AGORA_APP_ID: JSON.stringify(config.REACT_APP_AGORA_APP_ID),
      REACT_APP_AGORA_CUSTOMER_ID: JSON.stringify(
        config.REACT_APP_AGORA_CUSTOMER_ID,
      ),
      REACT_APP_AGORA_CUSTOMER_CERTIFICATE: JSON.stringify(
        config.REACT_APP_AGORA_CUSTOMER_CERTIFICATE,
      ),
      REACT_APP_AGORA_APP_TOKEN: JSON.stringify(
        config.REACT_APP_AGORA_APP_TOKEN,
      ),
      REACT_APP_AGORA_LOG: JSON.stringify(config.REACT_APP_AGORA_LOG),

      REACT_APP_AGORA_APP_SDK_DOMAIN: JSON.stringify(
        config.REACT_APP_AGORA_APP_SDK_DOMAIN,
      ),
      REACT_APP_YOUR_OWN_OSS_BUCKET_KEY: JSON.stringify(''),
      REACT_APP_YOUR_OWN_OSS_BUCKET_SECRET: JSON.stringify(''),
      REACT_APP_YOUR_OWN_OSS_BUCKET_NAME: JSON.stringify(''),
      REACT_APP_YOUR_OWN_OSS_CDN_ACCELERATE: JSON.stringify(''),
      REACT_APP_YOUR_OWN_OSS_BUCKET_FOLDER: JSON.stringify(''),
      // 'process': 'utils'
    }),
    new HardSourceWebpackPlugin({
      root: process.cwd(),
      directories: [],
      environmentHash: {
        root: process.cwd(),
        directories: [],
        files: [
          'package.json',
          'package-lock.json',
          'yarn.lock',
          '.env',
          '.env.local',
          'env.local',
          'config-overrides.js',
          'webpack.config.js',
        ],
      },
    }),
    // new InjectManifest({
    //   // injectionPoint: '__WB_MANIFEST',
    //   // importWorkboxFrom: 'local',
    //   // importsDirectory: path.join(__dirname, 'public'),
    //   // swSrc: path.join(__dirname, swSrcPath),
    //   // swSrc: path.join(process.cwd(), '/src/sw/index.worker.js'),
    //   swDest: 'serviceWorker.js',
    //   include: [],
    //   exclude: [/\.map$/, /manifest$/, /\.htaccess$/, /sw\.js$/],
    // }),
  ],
};