import type { Preview } from "@storybook/nextjs-vite";

import { fontVariables } from "../app/fonts";
import "../app/globals.css";

const preview: Preview = {
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story) => (
      <div className={`${fontVariables} font-sans antialiased`}>
        <Story />
      </div>
    ),
  ],
};

export default preview;