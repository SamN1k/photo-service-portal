using PSP.BusinessLayer.Actions;
using PSP.BusinessLayer.Interfaces;
using PSP.DataAccessLayer;

namespace PSP.BusinessLayer.Core;

public sealed class OfferLogic(PhotoPortalDbContext db) : OfferAction(db), IOfferLogic;
