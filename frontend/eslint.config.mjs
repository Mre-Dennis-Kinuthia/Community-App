import nextCoreWebVitals from "eslint-config-next/core-web-vitals"

const config = [
  {
    ignores: [".next/**", "node_modules/**", "scripts/**"],
  },
  ...nextCoreWebVitals,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      "react-hooks/static-components": "off",
      "react/no-unescaped-entities": "off",
    },
  },
]

export default config
