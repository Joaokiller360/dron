import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  // tu configuración actual
};

export default withNextIntl(nextConfig)