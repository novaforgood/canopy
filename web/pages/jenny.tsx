import React, { ReactNode, useEffect, useState } from "react";
import { faker } from "@faker-js/faker";

const ppl = new Array(64).fill(0).map((i) => {
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
  console.log(props);
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

export default function JennyNuoPage() {
  return (
    <div className="m-8 flex flex-row justify-around font-san flex-wrap">
      {ppl.map((person) => {
        // console.log(person);
        return <Card person={person} />;
      })}
    </div>
  );
}
