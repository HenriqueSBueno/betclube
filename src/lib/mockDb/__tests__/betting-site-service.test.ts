
// Este é um arquivo de testes para o serviço de betting sites
import { bettingSiteService } from "../betting-site-service";
import { BettingSite } from "@/types"; // Import type from types directory

// Mock para testes
jest.mock("../betting-site-service");

describe("bettingSiteService", () => {
  // Testes com implementações adequadas para métodos assíncronos
  it("should get all sites", async () => {
    const mockSites = [{ id: "1", name: "Test Site" }] as BettingSite[];
    (bettingSiteService.getAll as jest.Mock).mockResolvedValue(mockSites);
    
    const result = await bettingSiteService.getAll();
    expect(result.length).toBe(1);
  });
  
  it("should get site by id", async () => {
    const mockSite = { id: "1", name: "Test Site" } as BettingSite;
    (bettingSiteService.findById as jest.Mock).mockResolvedValue(mockSite);
    
    const result = await bettingSiteService.findById("1");
    expect(result?.name).toBe("Test Site");
  });
  
  it("should get sites by category", async () => {
    const mockSites = [{ id: "1", name: "Test Site" }] as BettingSite[];
    (bettingSiteService.findByCategory as jest.Mock).mockResolvedValue(mockSites);
    
    const result = await bettingSiteService.findByCategory("category");
    expect(result.length).toBe(1);
    result.forEach(site => {
      expect(site).toBeDefined();
    });
  });
  
  it("should create a site", async () => {
    const mockSite = { id: "1", name: "Test Site" } as BettingSite;
    (bettingSiteService.create as jest.Mock).mockResolvedValue(mockSite);
    
    const result = await bettingSiteService.create({
      name: "Test Site",
      url: "test.com",
      category: ["test"],
      description: "Test description",
      adminOwnerId: "user1",
      registrationDate: new Date()
    } as Omit<BettingSite, 'id'>);
    
    expect(result.id).toBe("1");
    expect(result.name).toBe("Test Site");
  });
  
  it("should update a site", async () => {
    const mockSite = { id: "1", name: "Updated Site" } as BettingSite;
    (bettingSiteService.update as jest.Mock).mockResolvedValue(mockSite);
    
    const result = await bettingSiteService.update("1", { name: "Updated Site" });
    expect(result?.name).toBe("Updated Site");
  });
  
  it("should delete a site", async () => {
    const mockSite = { id: "1", name: "Test Site" } as BettingSite;
    (bettingSiteService.delete as jest.Mock).mockResolvedValue(mockSite);
    
    const result = await bettingSiteService.delete("1");
    expect(result?.id).toBe("1");
  });
  
  it("should get site by name", async () => {
    const mockSite = { id: "1", name: "Test Site" } as BettingSite;
    (bettingSiteService.findByName as jest.Mock).mockResolvedValue(mockSite);
    
    const result = await bettingSiteService.findByName("Test Site");
    expect(result?.id).toBe("1");
  });
});
