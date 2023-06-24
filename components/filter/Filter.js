import React from "react";

const Filter = () => {
  return (
    <div className="m-3">
      <select
        name=""
        id=""
        className="text-sm w-36 bg-transparent text-primary outline-none px-5 py-1 border-2 border-primary rounded-full"
      >
        <option value="">
          Genre
        </option>
        <option value="">Action</option>
        <option value="">Adventure</option>
        <option value="">Thriller</option>
        <option value="">Comedy</option>
      </select>
    </div>
  );
};

export default Filter;
