module.exports = {
    content: [
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
      "./app/**/*.{js,ts,jsx,tsx}",
      "./node_modules/flowbite/**/*.js"
    ],
    // Legacy: Tailwind 4 only loads this file through an @config directive
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    plugins: [require("flowbite/plugin")],
  };
  