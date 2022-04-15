import React, { useEffect, useState } from "react";

interface NameCardProps {
  name: string;
}

function NameCard(props: NameCardProps) {
  const [color, setColor] = useState("#a6fff0");

  useEffect(() => {
    changeColor();
  }, [props.name]);

  const changeColor = () => {
    setColor(`#${Math.random().toString(16).slice(2, 8)}`);
  };

  return (
    <button
      onClick={changeColor}
      className={"p-4"}
      style={{
        backgroundColor: color,
      }}
    >
      <div>{props.name}</div>
    </button>
  );
}

export default function MaxPage() {
  const [name, setName] = useState("");
  return (
    <div>
      <div>Wow, a page!</div>
      <div>
        <input
          className="border border-black"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
      </div>
      <NameCard name={name} />
    </div>
  );
}
