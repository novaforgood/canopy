import type { NextPage } from "next";
import Link from "next/link";

import React, { useEffect, useState } from "react";

interface NameCardProps {
  name: string;
}

function NameCard(prop: NameCardProps) {
  const [color, setColor] = useState("green");
  useEffect(() => {
    changeColor();
  }, [prop.name]);
  const changeColor = () => {
    setColor(color === "green" ? "red" : "green");
  };

  return (
    <button
      onClick={changeColor}
      className={"p-4"}
      style={{
        backgroundColor: color,
      }}
    >
      <div>{prop.name}</div>
    </button>
  );
}

export default function Jeff() {
  const [name, setNames] = useState("Jeff");
  return (
    <div>
      <input
        value={name}
        onChange={(e) => {
          setNames(e.target.value);
        }}
      />
      <div>
        <NameCard name={name} />
      </div>
    </div>
  );
}
