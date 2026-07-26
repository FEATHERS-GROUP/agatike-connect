const fs = require('fs');

let fac = fs.readFileSync('src/components/page-builder/FacilityCheckoutSheet.tsx', 'utf8');
const facEffect = `
  useEffect(() => {
    if (!isOpen) {
      setDate(undefined);
      setQuantity(1);
      setIsGenerating(false);
      setIssuedTickets([]);
      setSelectedSlots([]);
      setIsSuccess(false);
      setIsPaymentModalOpen(false);
      setPawapayDepositId(null);
      setIsPollingPawaPay(false);
      setBookingRef("");
      setSummaryExpanded(false);
    }
  }, [isOpen]);
`;
// insert before the first useEffect, which is around line 487
fac = fac.replace(/  useEffect\(\(\) => \{\n    if \(!isPollingPawaPay/, facEffect + '\n  useEffect(() => {\n    if (!isPollingPawaPay');
fs.writeFileSync('src/components/page-builder/FacilityCheckoutSheet.tsx', fac);

let ven = fs.readFileSync('src/components/page-builder/VenueCheckoutSheet.tsx', 'utf8');
const venEffect = `
  useEffect(() => {
    if (!isOpen) {
      setDate("");
      setTicketsData({});
      setAttendees([]);
      setIsSuccess(false);
      setStep(1);
      setShowOverrideDialog(false);
      setIsGenerating(false);
      setIssuedTickets([]);
      setBookingReason("");
      setBookingReasonOther("");
      setIsPaymentModalOpen(false);
      setPawapayDepositId(null);
      setIsPollingPawaPay(false);
    }
  }, [isOpen]);
`;
ven = ven.replace(/  useEffect\(\(\) => \{\n    setIsHydrated\(true\)/, venEffect + '\n  useEffect(() => {\n    setIsHydrated(true)');
fs.writeFileSync('src/components/page-builder/VenueCheckoutSheet.tsx', ven);

