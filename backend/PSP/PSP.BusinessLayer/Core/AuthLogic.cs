using PSP.BusinessLayer.Actions;
using PSP.BusinessLayer.Interfaces;

namespace PSP.BusinessLayer.Core;

public sealed class AuthLogic(InMemoryDataStore store) : AuthAction(store), IAuthLogic;
