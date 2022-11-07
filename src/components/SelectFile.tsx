import { ChangeEvent } from 'react';

export type FileProps = {
  onChange({ target }: ChangeEvent<HTMLInputElement>): void;
};

export default function SelectFile({ onChange }: FileProps) {
  return <input onChange={onChange} type="file" accept="application/json" />;
}
