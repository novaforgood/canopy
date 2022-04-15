import React, { useEffect, useState } from "react";

interface NameCardProps {
  name: string;
}
function NameCard(props: NameCardProps) {
  const [color, setColor] = useState("deepskyblue");

  useEffect(() => {
    changeColor();
  }, [props.name]);
  
  const changeColor = () => {
    setColor(`#${Math.random().toString(16).slice(2, 8)}`);
  };
  return (
    <button
      className="p-4"
      style={{ backgroundColor: color }}
      onClick={changeColor}
    >
      <div>{props.name}</div>
    </button>
  );
}

export default function Nikhil() {
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
