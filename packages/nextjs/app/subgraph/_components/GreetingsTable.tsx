"use client";

import { gql, useQuery } from "@apollo/client";

//import { evmosTestnet } from "viem/chains";
//import { Address } from "~~/components/scaffold-eth";

const GreetingsTable = () => {
  const GREETINGS_GRAPHQL = `
  query MyQuery {
  events(first: 10) {
    deposit
    eventID
    eventOwner
    eventTimestamp
    totalRSVPs
    totalConfirmedAttendees
  }
}
`;

  const GREETINGS_GQL = gql(GREETINGS_GRAPHQL);
  const { data: eventsData, error } = useQuery(GREETINGS_GQL, { fetchPolicy: "network-only" });

  // Subgraph maybe not yet configured
  if (error) {
    return <></>;
  }

  return (
    <div className="flex justify-center items-center mt-10">
      <div className="overflow-x-auto shadow-2xl rounded-xl">
        <table className="table bg-base-100 table-zebra">
          <thead>
            <tr className="rounded-xl">
              <th className="bg-primary"></th>
              <th className="bg-primary">EventID</th>
              <th className="bg-primary">Total RSVPs</th>
              <th className="bg-primary">Confirmed Attendees</th>
            </tr>
          </thead>
          <tbody>
            {eventsData?.events?.map((event: any, index: number) => {
              return (
                <tr key={event.id}>
                  <th>{index + 1}</th>
                  <td>{event.eventID}</td>
                  <td>{event.totalRSVPs}</td>
                  <td>{event.totalConfirmedAttendees}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GreetingsTable;
