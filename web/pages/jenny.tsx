import React, { ReactNode, useEffect, useState } from "react";
import { faker } from "@faker-js/faker";

const ppl = new Array(70).fill(0).map((i) => {
  return {
    name: faker.name.firstName(),
    lname: faker.name.lastName(),
    job: faker.name.jobType(),
    company: faker.company.companyName(),
    pic: faker.image.avatar(),
    description: faker.lorem.paragraph(),
  };
});
class Card extends React.Component {
  TOPICS = "Topics";
  render() {
    return (
      <div className="m-8 flex flex-row justify-around font-san flex-wrap">
        {ppl.map((person) => {
          return (
            <div className="w-72 border-gray-400 mb-10 border-x border-y rounded-md">
              <div className="h-72 w-full border-none pb-4">
                <img
                  className="w-full rounded-t-md"
                  src={person.pic}
                  alt={person.name}
                />
              </div>
              <div className="px-8">
                <div className="pb-2 pt-4 text-2xl font-semibold">
                  {person.name} {person.lname}
                </div>
                <div className="mb-4 text-md pb-6">
                  {person.job} at {person.company}
                </div>
                <div className="pb-2">
                  <i>{this.TOPICS}</i>
                </div>
                <div className="mb-4 text-gray-500 text-ellipsis overflow-hidden">
                  {person.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

export default function JennyNuoPage() {
  return <Card></Card>;
}
