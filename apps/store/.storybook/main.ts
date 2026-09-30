import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  framework: "@storybook/nextjs-vite",
  stories: ["../app/**/*.stories.tsx"],
  core: {
    disableTelemetry: true,
  },
};

export default config;