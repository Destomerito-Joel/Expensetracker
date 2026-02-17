export default defineEventHandler(() => {
  const locations = [
    { city: "Orlando", state: "FL", label: "Orlando, FL" },
    { city: "Scottsdale", state: "AZ", label: "Scottsdale, AZ" },
    { city: "Palm Springs", state: "CA", label: "Palm Springs, CA" },
    { city: "Monterey", state: "CA", label: "Monterey, CA" },
    { city: "San Diego", state: "CA", label: "San Diego, CA" },
    { city: "Miami", state: "FL", label: "Miami, FL" },
    { city: "Las Vegas", state: "NV", label: "Las Vegas, NV" },
    { city: "Phoenix", state: "AZ", label: "Phoenix, AZ" },
    { city: "Austin", state: "TX", label: "Austin, TX" },
    { city: "Nashville", state: "TN", label: "Nashville, TN" },
    { city: "Hilton Head", state: "SC", label: "Hilton Head, SC" },
    { city: "Myrtle Beach", state: "SC", label: "Myrtle Beach, SC" },
  ]

  return { locations }
})
