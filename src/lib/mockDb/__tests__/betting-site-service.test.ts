
import { bettingSiteService } from '../betting-site-service';
import { bettingSites } from '../models';

// Save the original state
const originalBettingSites = [...bettingSites];

// Reset the betting sites array after each test
afterEach(() => {
  while (bettingSites.length) bettingSites.pop();
  originalBettingSites.forEach(site => bettingSites.push({...site}));
});

describe('Betting Site Service', () => {
  test('getAll returns all betting sites', () => {
    const sites = bettingSiteService.getAll();
    expect(sites.length).toBe(originalBettingSites.length);
    expect(sites).not.toBe(bettingSites); // Should return a copy
  });
  
  test('findById returns correct site', () => {
    const site = bettingSiteService.findById('1');
    expect(site).toBeDefined();
    expect(site?.name).toBe('Bet365');
  });
  
  test('findByCategory returns sites with matching category', () => {
    const pokerSites = bettingSiteService.findByCategory('Poker');
    expect(pokerSites.length).toBeGreaterThan(0);
    pokerSites.forEach(site => {
      expect(site.category).toContain('Poker');
    });
  });
  
  test('create adds new site and returns it', () => {
    const newSite = {
      name: 'Test Site',
      url: 'https://test.com',
      description: 'Test description',
      category: ['Test'],
      logoUrl: 'https://test.com/logo.png',
      registrationDate: new Date(),
      adminOwnerId: '1'
    };
    
    const created = bettingSiteService.create(newSite);
    expect(created.id).toBeDefined();
    expect(created.name).toBe(newSite.name);
    
    const found = bettingSiteService.findById(created.id);
    expect(found).toBeDefined();
  });
  
  test('update modifies existing site', () => {
    const updates = { name: 'Updated Name' };
    const updated = bettingSiteService.update('1', updates);
    expect(updated?.name).toBe('Updated Name');
    
    const found = bettingSiteService.findById('1');
    expect(found?.name).toBe('Updated Name');
  });
  
  test('delete removes site and returns it', () => {
    const initialCount = bettingSiteService.getAll().length;
    const deleted = bettingSiteService.delete('1');
    expect(deleted?.id).toBe('1');
    
    const remaining = bettingSiteService.getAll();
    expect(remaining.length).toBe(initialCount - 1);
    expect(bettingSiteService.findById('1')).toBeUndefined();
  });
});
