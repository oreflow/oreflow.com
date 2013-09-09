

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.*;

/**
 * Servlet implementation class MainServlet
 */
@WebServlet("/MainServlet")
public class MainServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	Map<String, String> UsersAndKeys = new HashMap<String, String>();
	Map<String, Session> ActiveSessions = new HashMap<String, Session>();
    /**
     * Default constructor. 
     */
    public MainServlet() {
    	UsersAndKeys.put("ILOVEWEBDEVELOPMENT!!!", "TestUser 1");
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

		System.out.println((new Date()).toString() + "  Accepting GET request");
		
		
		request.getRequestDispatcher("/index.html").include(request,response);
			
        
	}
	
	

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		System.out.println((new Date()).toString() + "  Accepting POST request");
		System.out.println((new Date()).toString() + "  requestType: " + request.getParameter("requestType"));
		
		String requestType = request.getParameter("requestType");
		if(requestType.equals("loginWords"))
		{
		
			request.setCharacterEncoding("utf8");
	        response.setCharacterEncoding("utf8");
	        response.setContentType("application/json");
	        PrintWriter out = response.getWriter();
	        
	        String para = request.getParameter("para");
	        if(para != null)
	        	System.out.println(para);
	        
	        //System.out.println(jsonObject.get("message"));
	        JsonArray array = new JsonArray();
	        for(String str : wordList())
	        {
	        	array.add(new JsonPrimitive(str));
	        }
	        
	        out.print(array);
	        return;
		}
		
		if(requestType.equals("loginString"))
		{
			System.out.println((new Date()).toString() + "  value of loginString: " + request.getParameter("loginString"));
			request.setCharacterEncoding("utf8");
	        response.setCharacterEncoding("utf8");
	        response.setContentType("application/json");
	        
	        
	        String key = request.getParameter("loginString");
	        if(UsersAndKeys.containsKey(key))
	        {
	        	String user = UsersAndKeys.get(key);
	        	PrintWriter out = response.getWriter();
	        	String session = createSessionID();
	        	ActiveSessions.put(session, new Session(session, user));
	        	JsonObject json = new JsonObject();
	        	json.add("session", new JsonPrimitive(session));
	        	out.print(json);
	        }
	        else{
	        	response.sendError(401);
	        }
	        return;
		}

	}
	
	private ArrayList<String> wordList()
	{
		ArrayList<String> strings  = new ArrayList<String>();
		strings.add("I");
		strings.add("RANDOM");
		strings.add("WEB");
		strings.add("DEVELOPMENT");
		strings.add("POWERFUL");
		strings.add("LOL");
		strings.add("LOVE");
		strings.add("HELLO");
		strings.add("WORLD");
		strings.add("JAVASCRIPT");
		strings.add("C++");
		strings.add("C#");
		strings.add("!!!");
		strings.add("AM");
		strings.add("BEAUTIFUL");
		strings.add("CUTE");
		strings.add("DONKEY");
		strings.add("WHAT");
		strings.add("MORPH");
		strings.add("COOL");
	return strings;
	}
	
	private String createSessionID()
	{
		char[] chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".toCharArray();
		StringBuilder sb = new StringBuilder();
		Random random = new Random();
		for (int i = 0; i < 32; i++) {
		    char c = chars[random.nextInt(chars.length)];
		    sb.append(c);
		}
		String session = sb.toString(); 
		if(ActiveSessions.containsKey(session))
			return createSessionID();
		else
			return session;
	}

	protected class Session {
		String page;
		String SessionID;
		String userName;
		public Session(String SID, String user)
		{
			SessionID = SID;
			userName = user;
		}
	}
}
