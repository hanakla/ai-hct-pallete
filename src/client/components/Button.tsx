import { DetailedHTMLProps, ButtonHTMLAttributes } from "react";
import clx from "classnames";

interface Props {
  kind?: "normal" | "primary";
}

export const Button = ({
  kind,
  className,
  ...props
}: Props &
  DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >) => {
  return (
    <button
      css={`
        padding: 0px 8px;
        font-size: 12px;
      `}
      className={clx(
        kind === "primary" ? "topcoat-button--cta" : "topcoat-button",
        className
      )}
      {...props}
    />
  );
};
