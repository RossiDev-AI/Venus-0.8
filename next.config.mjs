/** @type {import('next').NextConfig} */
const nextConfig = {
  // Adicione a URL exata que apareceu no seu erro
  allowedDevOrigins: [
    "9000-firebase-venus-08-1769182217749.cluster-lqzyk3r5hzdcaqv6zwm7wv6pwa.cloudworkstations.dev",
    "*.cloudworkstations.dev",
    "*.google.com"
  ],
};

export default nextConfig;