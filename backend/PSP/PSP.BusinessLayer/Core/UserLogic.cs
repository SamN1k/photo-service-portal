using PSP.BusinessLayer.Actions;
using PSP.BusinessLayer.Interfaces;

namespace PSP.BusinessLayer.Core;

public sealed class UserLogic(InMemoryDataStore store) : UserAction(store), IUserLogic;
