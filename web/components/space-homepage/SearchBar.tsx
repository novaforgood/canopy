import { BxSearch } from "../../generated/icons/regular";
import { TextInput } from "../inputs/TextInput";

export function SearchBar() {
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
    <div className="flex items-center justify-between gap-2">
      <TextInput placeholder="Search by keyword" className="w-full" />
      {/* <Select
              className="w-64"
              value={""}
              options={INTERESTS.map((item) => {
                return {
                  label: item,
                  value: item,
                };
              })}
            /> */}
      <button className="flex-none bg-gray-300 flex justify-center items-center self-stretch w-16 rounded-md hover:brightness-105 active:translate-y-px transition">
        <BxSearch className="h-7 w-7 text-white" />
      </button>
    </div>
  );
}
