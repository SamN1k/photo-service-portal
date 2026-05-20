using PSP.BusinessLayer.Actions;
using PSP.BusinessLayer.Interfaces;

namespace PSP.BusinessLayer.Core;

public sealed class BookingLogic(InMemoryDataStore store) : BookingAction(store), IBookingLogic;
