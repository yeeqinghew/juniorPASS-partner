import ClassCard from "./ClassCard";

const InactiveClasses = ({ listing, setListing }) => {
  const inactiveListings = listing?.filter((list) => !list.active);

  return (
    <div
      style={{
        display: "grid",
        gridAutoRows: "1fr",
        gridTemplateColumns: "1fr 1fr 1fr",
      }}
    >
      {inactiveListings &&
        inactiveListings.map((list) => (
          <ClassCard
            key={list.listing_id}
            listing={list}
            setListing={setListing}
          />
        ))}
    </div>
  );
};

export default InactiveClasses;
