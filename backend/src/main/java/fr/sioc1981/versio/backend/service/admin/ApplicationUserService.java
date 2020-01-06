package fr.sioc1981.versio.backend.service.admin;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.annotation.security.DeclareRoles;
import javax.annotation.security.PermitAll;
import javax.annotation.security.RolesAllowed;
import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.PersistenceContext;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.jboss.ejb3.annotation.SecurityDomain;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import fr.sioc1981.versio.backend.entity.ApplicationUser;
import fr.sioc1981.versio.backend.security.Security;
import fr.sioc1981.versio.backend.service.GlobalSSE;

@Path("/admin/applicationUser")
@Stateless
@SecurityDomain(Security.Domain.DOMAIN)
@DeclareRoles({Security.Role.ADMIN_ONLY, Security.Role.BACKEND})
public class ApplicationUserService {

	Logger log = LoggerFactory.getLogger(ApplicationUserService.class.getName());

	@PersistenceContext
	private EntityManager entityManager;

	@EJB
	private GlobalSSE globalSSE;

	@Context
	private HttpServletRequest request;

	@POST
	@Consumes("application/json")
	@RolesAllowed(Security.Role.ADMIN_ONLY)
	public Response create(ApplicationUser newApplicationUser) {
		log.info("create {}", newApplicationUser);
		this.entityManager.persist(newApplicationUser);
		ApplicationUser applicationUser = this.entityManager.createQuery("from ApplicationUser where id = :id", ApplicationUser.class)
				.setParameter("id", newApplicationUser.getId()).getSingleResult();
		getCount();
		sendSSE(applicationUser);
		return Response.ok(applicationUser).build();
	}

	@PUT
	@Consumes("application/json")
	@RolesAllowed(Security.Role.ADMIN_ONLY)
	public Response update(ApplicationUser newApplicationUser) {
		ApplicationUser application = this.entityManager.merge(newApplicationUser);
		globalSSE.broadcast("applicationUser_" + application.getId(), application);
		return Response.ok(application).build();
	}

	@GET
	@Produces("application/json")
	@PermitAll
	public Response findAll() {
		return Response.ok(this.entityManager.createQuery("from ApplicationUser").getResultList()).build();
	}

	@GET
	@Produces("application/json")
	@Path("/summary")
	public Response summarize() {
		return Response.ok(getCount()).build();
	}

	@RolesAllowed(Security.Role.BACKEND)
	public Long getCount() {
		Long count = this.entityManager.createQuery("select count(1) as count from ApplicationUser", Long.class)
				.getSingleResult();
		globalSSE.broadcast("applicationUser_count", count);
		return count;
	}
	
	@RolesAllowed(Security.Role.BACKEND)
	public List<ApplicationUser> getSummary() throws NoResultException {
		Stream<ApplicationUser> stream = this.entityManager.createQuery("from ApplicationUser", ApplicationUser.class).getResultStream();
		return stream.map(this::sendSSE).collect(Collectors.toList());
	}
	
	private ApplicationUser sendSSE(ApplicationUser applicationUser) {
		globalSSE.broadcast("applicationUser_summary_" + applicationUser.getId(), applicationUser);
		return applicationUser;
	}


	@GET
	@Path("{id}")
	@Produces("application/json")
	@PermitAll
	public Response findById(@PathParam("id") String id) {
		List<ApplicationUser> result = this.entityManager.createQuery("from ApplicationUser where id = :id", ApplicationUser.class)
				.setParameter("id", id).getResultList();

		if (result.isEmpty()) {
			return Response.status(Status.NOT_FOUND).build();
		}

		return Response.ok(result.get(0)).build();
	}

}
