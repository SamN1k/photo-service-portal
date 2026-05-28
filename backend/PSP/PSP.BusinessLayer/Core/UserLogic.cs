using PSP.BusinessLayer.Structure;
using PSP.BusinessLayer.Interfaces;
using PSP.DataAccessLayer.Context;

namespace PSP.BusinessLayer.Core;

public sealed class UserLogic(PhotoPortalDbContext db, IPasswordHasher passwordHasher)
    : UserAction(db, passwordHasher), IUserLogic;
