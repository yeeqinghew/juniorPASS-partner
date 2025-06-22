import ClassCard from "./ClassCard";

const AllClasses = ({ listing }) => {
  return (
    <div
      style={{
        display: "grid",
        gridAutoRows: "1fr",
        gridTemplateColumns: "1fr 1fr 1fr",
      }}
    >
      {listing &&
        listing.map((list) => (
          <ClassCard key={list.listing_id} listing={list} />
        ))}
    </div>
  );
};

export default AllClasses;
