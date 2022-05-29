import React, { ReactNode, useEffect, useState } from "react";

import { faker } from "@faker-js/faker";

import { Card } from "../components/Card";
import { useCurrentProfile } from "../hooks/useCurrentProfile";

// const id = currentProfile?.id;

// const [{ data: names }] = usePersonNameQuery({ id });

const ppl = new Array(4).fill(0).map((i) => {
  return {
    name: faker.name.firstName(),
    lname: faker.name.lastName(),
    job: faker.name.jobType(),
    company: faker.company.companyName(),
    pic: faker.image.avatar(),
    description: faker.lorem.paragraph(),
  };
});

function SearchBar() {
  const INTERESTS = [
    "Interests",
    "Anime",
    "Kdramas",
    "Sports",
    "Basketball",
    "Coding",
  ];
  const COMMUNITY = ["Community", "Friends", "Family", "Work", "School"];
  const handleChange = () => {};
  return (
    <div className="flex items-center justify-between p-3">
      <input
        className="w-7/12 border-x border-y border-gray-400 p-3 rounded-md"
        placeholder="Search by keyword"
      />
      <select
        className="border-x border-y border-gray-400 p-3 rounded-md w-2/12"
        onChange={handleChange}
      >
        {INTERESTS.map((item, idx) => {
          // console.log(item);
          return (
            <option value={item} key={idx}>
              {item}
            </option>
          );
        })}
      </select>
      <select
        className="border-x border-y border-gray-400 p-3 rounded-md w-2/12"
        onChange={handleChange}
      >
        {COMMUNITY.map((item, idx) => {
          // console.log(item);
          return (
            <option value={item} key={idx}>
              {item}
            </option>
          );
        })}
      </select>
      <button className="border-x border-y border-gray-400 p-3 rounded-md w-20 bg-gray-300">
        Search
      </button>
    </div>
  );
}

export default function JennyNuoPage() {
  return (
    <div>
      <div className="ml-12 mr-12">
        <SearchBar />
      </div>
      <div className="m-8 flex flex-row justify-around font-san flex-wrap">
        {ppl.map((person, idx) => {
          // console.log(person);
          return <Card person={person} key={idx} />;
        })}
      </div>
    </div>
  );
}
