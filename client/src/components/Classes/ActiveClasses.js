import ClassCard from "./ClassCard";

const ActiveClasses = ({ listing, setListing }) => {
  const activeListings = listing?.filter((list) => list.active);

  return (
    <div
      style={{
        display: "grid",
        gridAutoRows: "1fr",
        gridTemplateColumns: "1fr 1fr 1fr",
      }}
    >
      {activeListings &&
        activeListings.map((list) => (
          <ClassCard
            key={list.listing_id}
            listing={list}
            setListing={setListing}
          />
        ))}
    </div>
  );
};

export default ActiveClasses;
