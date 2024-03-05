import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'SMLC',
  tagline: 'Scrap Mechanic Logic Consortium',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://sm-lc.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'Scrap-Mechanic-Logic-Consortium', // Usually your GitHub org/user name.
  projectName: 'SMLC-Website', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'terminology',
        path: 'repoTemp/SMLC-Terminology/terminology',
        routeBasePath: 'terminology',
        sidebarPath: require.resolve('./sidebars.js'),
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'standards',
        path: 'repoTemp/SMLC-Standards/standards',
        routeBasePath: 'standards',
        sidebarPath: require.resolve('./sidebars.js'),
      },
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'SMLC',
      logo: {
        alt: 'SMLC logo',
        src: 'img/logo.png',
      },
      items: [
        {
          to: '/terminology/intro',
          label: 'Terminology',
          position: 'left',
        },
        {
          to: '/standards/intro',
          label: 'Standards',
          position: 'left',
        },
        {
          href: 'https://discord.gg/********',
          label: 'Discord',
          position: 'right',
        },
        {
          href: 'https://github.com/Scrap-Mechanic-Logic-Consortium',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
