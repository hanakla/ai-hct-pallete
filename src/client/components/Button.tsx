import { DetailedHTMLProps, ButtonHTMLAttributes } from "react";

interface Props {
  kind?: "normal" | "primary";
}

export const Button = ({
  kind,
  ...props
}: Props &
  DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >) => {
  return (
    <button
      className={kind === "primary" ? "topcoat-button--cta" : "topcoat-button"}
      {...props}
    />
  );
};
