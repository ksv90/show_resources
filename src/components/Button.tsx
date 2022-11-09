import { MouseEvent } from 'react';

export type ButtonProps = {
  name: string;
  onClick(event: MouseEvent<HTMLButtonElement>): void;
};

export default function Button({ name, onClick }: ButtonProps) {
  return (
    <button type="button" name={name} onClick={onClick}>
      {name}
    </button>
  );
}
