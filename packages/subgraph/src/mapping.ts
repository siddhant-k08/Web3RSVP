import { Address , json } from "@graphprotocol/graph-ts";
import {
  ConfirmedAttendee,
  NewEventCreated,
  NewRSVP,
  DepositsPaidOut,
} from "../generated/YourContract/YourContract";
import {
  Account,
  RSVP,
  Confirmation,
  Event
} from "../generated/schema";
import { integer } from "@protofire/subgraph-toolkit";

export function handleNewEventCreated(event: NewEventCreated): void {
  let newEvent = Event.load(event.params.eventId.toHex());
  if (newEvent == null) {
    newEvent = new Event(event.params.eventId.toHex());
    newEvent.eventID = event.params.eventId;
    newEvent.eventOwner = event.params.creatorAddress;
    newEvent.eventTimestamp = event.params.eventTimestamp;
    newEvent.maxCapacity = event.params.maxCapacity;
    newEvent.deposit = event.params.deposit;
    newEvent.paidOut = false;
    newEvent.totalRSVPs = integer.ZERO;
    newEvent.totalConfirmedAttendees = integer.ZERO;

    // let metadata = ipfs.cat(event.params.eventDataCID + "/data.json");

    // if (metadata) {
    //   const value = json.fromBytes(metadata).toObject();
    //   if (value) {
    //     const name = value.get("name");
    //     const description = value.get("description");
    //     const link = value.get("link");
    //     const imagePath = value.get("image");

    //     if (name) {
    //       newEvent.name = name.toString();
    //     }

    //     if (description) {
    //       newEvent.description = description.toString();
    //     }

    //     if (link) {
    //       newEvent.link = link.toString();
    //     }

    //     if (imagePath) {
    //       const imageURL =
    //         "https://ipfs.io/ipfs/" +
    //         event.params.eventDataCID +
    //         imagePath.toString();
    //       newEvent.imageURL = imageURL;
    //     } else {
    //       const fallbackURL =
    //         "https://ipfs.io/ipfs/bafybeibssbrlptcefbqfh4vpw2wlmqfj2kgxt3nil4yujxbmdznau3t5wi/event.png";
    //       newEvent.imageURL = fallbackURL;
    //     }
    //   }
    // }

    newEvent.save();
  }
}

function getOrCreateAccount(address: Address): Account {
  let account = Account.load(address.toHex());
  if (account == null) {
    account = new Account(address.toHex());
    account.totalRSVPs = integer.ZERO;
    account.totalAttendedEvents = integer.ZERO;
    account.save();
  }
  return account;
}

export function handleNewRSVP(event: NewRSVP): void {
  let id = event.params.eventId.toHex() + event.params.attendeeAddress.toHex();
  let newRSVP = RSVP.load(id);
  let account = getOrCreateAccount(event.params.attendeeAddress);
  let thisEvent = Event.load(event.params.eventId.toHex());
  if (newRSVP == null && thisEvent != null) {
    newRSVP = new RSVP(id);
    newRSVP.attendee = account.id;
    newRSVP.event = thisEvent.id;
    newRSVP.save();
    thisEvent.totalRSVPs = integer.increment(thisEvent.totalRSVPs);
    thisEvent.save();
    account.totalRSVPs = integer.increment(account.totalRSVPs);
    account.save();
  }
}

export function handleConfirmedAttendee(event: ConfirmedAttendee): void {
  let id = event.params.eventId.toHex() + event.params.attendeeAddress.toHex();
  let newConfirmation = Confirmation.load(id);
  let account = getOrCreateAccount(event.params.attendeeAddress);
  let thisEvent = Event.load(event.params.eventId.toHex());
  if (newConfirmation == null && thisEvent != null) {
    newConfirmation = new Confirmation(id);
    newConfirmation.attendee = account.id;
    newConfirmation.event = thisEvent.id;
    newConfirmation.save();

    thisEvent.totalConfirmedAttendees = integer.increment(
      thisEvent.totalConfirmedAttendees
    );
    thisEvent.save();

    account.totalAttendedEvents = integer.increment(
      account.totalAttendedEvents
    );
    account.save();
  }
}

export function handleDepositsPaidOut(event: DepositsPaidOut): void {
  let thisEvent = Event.load(event.params.eventId.toHex());
  if (thisEvent) {
    thisEvent.paidOut = true;
    thisEvent.save();
  }
}