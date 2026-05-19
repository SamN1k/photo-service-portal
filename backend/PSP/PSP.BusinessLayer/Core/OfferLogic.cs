using PSP.BusinessLayer.Actions;
using PSP.BusinessLayer.Interfaces;

namespace PSP.BusinessLayer.Core;

public sealed class OfferLogic(InMemoryDataStore store) : OfferAction(store), IOfferLogic;
