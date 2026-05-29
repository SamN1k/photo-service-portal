using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PSP.BusinessLayer.Core;
using PSP.BusinessLayer.Interfaces;
using PSP.Domain.Models;

namespace PSP.API.Controllers;

[Route("api/reports")]
[Authorize]
public sealed class ProblemReportsController(IProblemReportLogic reportLogic) : ApiControllerBase
{
    [HttpGet]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<PaginatedResultDto<ProblemReportDto>>> ListReports([FromQuery] ProblemReportListQueryDto filters)
    {
        try
        {
            return Ok(await reportLogic.ListReportsAsync(filters));
        }
        catch (BusinessException exception)
        {
            return FromBusinessException(exception);
        }
        catch (DbUpdateException exception)
        {
            return FromDatabaseException(exception);
        }
    }

    [HttpGet("my")]
    [Authorize(Roles = "user,photographer")]
    public async Task<ActionResult<PaginatedResultDto<ProblemReportDto>>> ListMyReports([FromQuery] ProblemReportListQueryDto filters)
    {
        if (string.IsNullOrWhiteSpace(CurrentUserId))
        {
            return Unauthorized();
        }

        try
        {
            return Ok(await reportLogic.ListReporterReportsAsync(CurrentUserId, filters));
        }
        catch (BusinessException exception)
        {
            return FromBusinessException(exception);
        }
        catch (DbUpdateException exception)
        {
            return FromDatabaseException(exception);
        }
    }

    [HttpPost]
    [Authorize(Roles = "user,photographer")]
    public async Task<ActionResult<ProblemReportDto>> CreateReport([FromBody] ProblemReportInputDto input)
    {
        if (string.IsNullOrWhiteSpace(CurrentUserId))
        {
            return Unauthorized();
        }

        try
        {
            var report = await reportLogic.CreateReportAsync(CurrentUserId, input);
            return Created($"/api/reports/{report.Id}", report);
        }
        catch (BusinessException exception)
        {
            return FromBusinessException(exception);
        }
        catch (DbUpdateException exception)
        {
            return FromDatabaseException(exception);
        }
    }

    [HttpPatch("{reportId}/status")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<ProblemReportDto>> UpdateReportStatus(string reportId, [FromBody] ProblemReportStatusUpdateDto input)
    {
        try
        {
            return Ok(await reportLogic.UpdateReportStatusAsync(reportId, input));
        }
        catch (BusinessException exception)
        {
            return FromBusinessException(exception);
        }
        catch (DbUpdateException exception)
        {
            return FromDatabaseException(exception);
        }
    }
}
