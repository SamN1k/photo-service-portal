namespace PSP.Domain.Models.Offer;

public sealed class OfferListQueryDto
{
    public string? Query { get; set; }
    public string? Category { get; set; }
    public string? Status { get; set; }
    public string? SortBy { get; set; }
    public int? Page { get; set; }
    public int? PageSize { get; set; }
    public string? PhotographerId { get; set; }
    public bool PublicOnly { get; set; }
    public bool ForceError { get; set; }
}
