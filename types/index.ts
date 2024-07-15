import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type PageProps = {
  params: ThreadParams;
};

type ThreadParams = {
  threadId: string;
};
