import React, { useEffect, useState } from "react";

interface NameCardProps {
  name: string;
}

function NameCard(props: NameCardProps) {
  const [color, setColor] = useState("pink");

  useEffect((): void => {
    setColor("red");
  }, [props.name]);

  const changeColor = () => {
    setColor(color === "pink" ? "salmon" : "pink");
  };

  return (
    <button
      onClick={() => {
        setColor("pink" ? "salmon" : "pink");
      }}
      className={"p-4"}
      style={{
        backgroundColor: color,
      }}
    >
      <h1>{props.name}</h1>
    </button>
  );
}

export default function JennyNuoPage() {
  const [name, setName] = useState("");
  return (
    <div>
      <div>Wow, a page! jenny nuo</div>
      <div>
        <input className="border border-black" value={name} />
      </div>
      <NameCard name={name} />
    </div>
  );
}
