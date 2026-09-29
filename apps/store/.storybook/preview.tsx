import type { Preview } from "@storybook/nextjs-vite";

import "../app/globals.css";

const preview: Preview = {
	parameters: {
		nextjs: {
			appDirectory: true,
		},
	},
};

export default preview;