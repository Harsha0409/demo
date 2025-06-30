declare global {
  interface Window {
    dataLayer: any[];
  }
}

const EVENT_WHITELISTS: Record<string, string[]> = {
  // Login event
  login: ['event', 'mobile', 'userId', 'status'],
  // User message in chat
  user_message: ['event', 'type', 'content', 'chatId', 'gtm', 'method', 'userId'],
  // AI message in chat
  ai_message: ['event', 'type', 'content', 'chatId', 'data', 'bus_recommendations', 'analytics'],
  // Look, Block, Book Flow
  look: ['event', 'tripId', 'boarding', 'dropping', 'seats'],
  block: ['event', 'payload'],
  book: ['event', 'ticketData'],
  // Bus card seat layout view
  bus_card_view_seat_layout: ['event', 'busId'],
  // Bus card dropping selected
  bus_card_dropping_selected: ['event', 'busId', 'droppingPoint'],
  // Green coins selection
  bus_card_green_coins_selected: ['event', 'busId', 'value'],
  // Fresh card selection
  bus_card_fresh_card_selected: ['event', 'busId', 'value'],
  bus_card_fresh_card_removed: ['event', 'busId'],
  bus_card_fresh_card_purchase_initiated: ['event', 'busId', 'amount'],
  bus_card_fresh_card_purchase_cancelled: ['event', 'busId'],
  // Passenger details
  passenger_details_provided: ['event', 'busId', 'method', 'passengerDetails', 'passenger'],
  // Payment events
  bus_card_payment_status: ['event', 'busId', 'status', 'error'],
  // Cancellation events
  cancel_card_confirm: ['event', 'bookingId', 'selectedSeats', 'refundMethod'],
  cancel_card_status: ['event', 'bookingId', 'status', 'details'],
  cancel_card_refund_policy_viewed: ['event', 'bookingId'],
  // Logout
  logout: ['event', 'userId'],
};

export function trackGTMEvent(event: string, data: Record<string, any> = {}) {
  // Always create a fresh object
  let eventObj: Record<string, any> = { event, ...data };

  // Filter attributes based on event type
  if (EVENT_WHITELISTS[event]) {
    const allowed = EVENT_WHITELISTS[event];
    eventObj = Object.fromEntries(Object.entries(eventObj).filter(([k]) => allowed.includes(k)));
  }

  // Remove all keys with undefined values
  eventObj = Object.fromEntries(Object.entries(eventObj).filter(([_, v]) => v !== undefined));

  console.log('[GTM PUSH]', eventObj);
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(eventObj);

  // To prevent recommendation data from persisting across events in a SPA,
  // we clear it from the dataLayer after it has been sent.
  if (eventObj.bus_recommendations) {
    // Push an object without an event key to clear all contextual bus fields
    // without tracking a new event.
    window.dataLayer.push({
      bus_recommendations: undefined,
      analytics: undefined,
      data: undefined,
      tripId: undefined,
      seat_category: undefined,
      displayed_boarding_point: undefined,
      displayed_dropping_point: undefined,
      content: undefined,
      type: undefined
    });
    console.log('[GTM PUSH] Cleared contextual bus data');
  }
}