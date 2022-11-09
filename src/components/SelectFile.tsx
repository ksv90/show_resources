import { ChangeEvent, useEffect, useRef } from 'react';

export type FileProps = {
  onChange({ target }: ChangeEvent<HTMLInputElement>): void;
};

export default function SelectFile({ onChange }: FileProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.webkitdirectory = true;
  }, [ref]);

  return (
    <input
      type="file"
      multiple
      accept="application/json, image/png, image/jpeg, .atlas"
      onChange={onChange}
      ref={ref}
    />
  );
}
