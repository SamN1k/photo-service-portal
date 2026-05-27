using PSP.BusinessLayer.Actions;
using PSP.BusinessLayer.Interfaces;
using PSP.DataAccessLayer;

namespace PSP.BusinessLayer.Core;

public sealed class AuthLogic(PhotoPortalDbContext db) : AuthAction(db), IAuthLogic;
