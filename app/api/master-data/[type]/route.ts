import { NextRequest, NextResponse } from 'next/server';

// Mock data - in real app this would come from database
const mockData = {
  category: [
    { id: '1', name: 'Network', description: 'Network related issues', isActive: true },
    { id: '2', name: 'Hardware', description: 'Hardware related issues', isActive: true },
    { id: '3', name: 'Software', description: 'Software related issues', isActive: true },
  ],
  subcategory: [
    { id: '1', name: 'WiFi Issue', description: 'WiFi connectivity problems', isActive: true },
    { id: '2', name: 'System Issue', description: 'System performance problems', isActive: true },
    { id: '3', name: 'Printer Issue', description: 'Printer connectivity problems', isActive: true },
    { id: '4', name: 'Internet Issue', description: 'Internet connectivity problems', isActive: true },
    { id: '5', name: 'Application Crash', description: 'Application suddenly closing', isActive: true },
  ],
  priority: [
    { id: '1', name: 'High', description: 'High priority issues', color: '#FF4444', level: 1, isActive: true },
    { id: '2', name: 'Medium', description: 'Medium priority issues', color: '#FFA500', level: 2, isActive: true },
    { id: '3', name: 'Low', description: 'Low priority issues', color: '#22C55E', level: 3, isActive: true },
  ],
  severity: [
    { id: '1', name: 'Critical', description: 'Critical severity issues', level: 1, isActive: true },
    { id: '2', name: 'High', description: 'High severity issues', level: 2, isActive: true },
    { id: '3', name: 'Medium', description: 'Medium severity issues', level: 3, isActive: true },
    { id: '4', name: 'Low', description: 'Low severity issues', level: 4, isActive: true },
  ],
  source: [
    { id: '1', name: 'Email', description: 'Issues reported via email', isActive: true },
    { id: '2', name: 'Phone', description: 'Issues reported via phone', isActive: true },
    { id: '3', name: 'Walk-in', description: 'Issues reported in person', isActive: true },
    { id: '4', name: 'Self-Service Portal', description: 'Issues reported via portal', isActive: true },
  ],
  department: [
    { id: '1', name: 'IT', description: 'Information Technology Department', isActive: true },
    { id: '2', name: 'HR', description: 'Human Resources Department', isActive: true },
    { id: '3', name: 'Finance', description: 'Finance Department', isActive: true },
    { id: '4', name: 'Operations', description: 'Operations Department', isActive: true },
  ],
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    
    if (!type || !mockData[type as keyof typeof mockData]) {
      return NextResponse.json(
        { error: 'Invalid master data type' },
        { status: 400 }
      );
    }

    const data = mockData[type as keyof typeof mockData].filter(item => item.isActive);
    
    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Master data API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
