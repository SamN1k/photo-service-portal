using PSP.BusinessLayer.Actions;
using PSP.BusinessLayer.Interfaces;
using PSP.DataAccessLayer.Context;

namespace PSP.BusinessLayer.Core;

public sealed class OfferLogic(PhotoPortalDbContext db) : OfferAction(db), IOfferLogic;
