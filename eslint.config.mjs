import nextVitals from "eslint-config-next/core-web-vitals";
export default [
  ...nextVitals,
  { ignores: ["out/**", ".next/**", "node_modules/**", "scripts/**", ".claude/**", "tmp/**"] },
];
