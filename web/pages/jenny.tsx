import React, { ReactNode, useEffect, useState } from "react";
import { faker } from "@faker-js/faker";
import { usePersonNameQuery } from "../generated/graphql";
import { useCurrentProfile } from "../hooks/useCurrentProfile";
import { useUserData } from "../hooks/useUserData";
import { useAllProfilesOfUserQuery } from "../generated/graphql";

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

type Person = {
  name: string;
  lname: string;
  job: string;
  company: string;
  pic: string;
  description: string;
};

function Card(props: { person: Person }) {
  const { userData } = useUserData();
  const [{ data: profileData }] = useAllProfilesOfUserQuery({
    variables: { user_id: userData?.id ?? "" },
  });
  console.log(profileData?.profile);
  console.log("whore");
  const TOPICS = "Topics";
  return (
    <div className="w-72 border-gray-400 mb-10 border-x border-y rounded-md">
      <div className="h-72 w-full border-none pb-4">
        <img
          className="w-full rounded-t-md"
          src={props.person.pic}
          alt={props.person.name}
        />
      </div>
      <div className="px-8">
        <div className="pb-2 pt-4 text-2xl font-semibold">
          {props.person.name} {props.person.lname}
        </div>
        <div className="mb-4 text-md pb-6">
          {props.person.job} at {props.person.company}
        </div>
        <div className="pb-2">
          <i>{TOPICS}</i>
        </div>
        <div className="mb-4 text-gray-500 text-ellipsis overflow-hidden">
          {props.person.description}
        </div>
      </div>
    </div>
  );
}

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
        {INTERESTS.map((item) => {
          // console.log(item);
          return <option value={item}>{item}</option>;
        })}
      </select>
      <select
        className="border-x border-y border-gray-400 p-3 rounded-md w-2/12"
        onChange={handleChange}
      >
        {COMMUNITY.map((item) => {
          // console.log(item);
          return <option value={item}>{item}</option>;
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
        {ppl.map((person) => {
          // console.log(person);
          return <Card person={person} />;
        })}
      </div>
    </div>
  );
}
