import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Standardization',
    Svg: require('@site/static/img/puzzle pieces line.svg').default,
    description: (
      <>
        We establish standards for logic creations, promoting compatibility across different designs. Our standards include clear documentation and examples.
      </>
    ),
  },
  {
    title: 'Compilation',
    Svg: require('@site/static/img/clipboard line.svg').default,
    description: (
      <>
        We compile a searchable database of standard-compliant logic creations, providing clear definitions for common terms to aid in discovery.
      </>
    ),
  },
  {
    title: 'Evaluation',
    Svg: require('@site/static/img/stopwatch line.svg').default,
    description: (
      <>
        We provide independent testing and evaluation of logic creations (speed, size, etc.). Our tools and instructions empower everyone to verify our results.
      </>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
