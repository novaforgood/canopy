import React from "react";
import Tag from "../components/atomic/Tag";

const { faker } = require("@faker-js/faker");

const randomName = faker.name.findName(); // Rowan Nikolaus
const randomEmail = faker.internet.email(); // Kassandra.Haley@erich.biz
const randomPhoneNumber = faker.phone.phoneNumber(); // (279) 329-8663 x30233

let space_tags = new Array(8).fill(0).map(() => {
  return { tag: faker.lorem.word() };
});

let categories = new Array(2).fill(0).map(() => {
  return { space_tags };
});

export default function tag_test() {
  console.log(categories);
  return (
    <div>
      {categories.map((category) => {
        return (
          <div key={categories.indexOf(category)}>
            <div className="text-xl">
              Category {categories.indexOf(category)}:
            </div>
            <div className="h-4"></div>
            <div className="flex gap-2 items-start">
              {category.space_tags.map((tag) => {
                return (
                  <Tag
                    key={tag.tag}
                    className="p-2 border"
                    onClick={() => {
                      console.log("clicked");
                    }}
                  >
                    <span>{tag.tag}</span>
                  </Tag>
                );
              })}
            </div>
            <div className="h-16"></div>
          </div>
        );
      })}
    </div>
  );
}
