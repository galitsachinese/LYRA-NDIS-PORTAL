
//Reusable login function used by all spec files 
export async function loginAs( 

page: Page, 

role: 'participant' | 'coordinator' 

) { 

const credentials = { 

participant: { 

email: 'participant1@ndisportal.com', 

password: 'Test@1234' 

}, 

coordinator: { 

email: 'coordinator@ndisportal.com', 

password: 'Test@1234' 

} 

}; 

await page.goto('/login'); 

await page.fill('[data-testid="email-input"]', 

credentials[role].email);

await page.fill('[data-testid="password-input"]', 

credentials[role].password); 

await page.click('[data-testid="login-btn"]'); 

await page.waitForURL( 

role === 'coordinator' ? '/dashboard' : '/services' 

); 

}
